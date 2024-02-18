const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
//signup
const signupSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
});
router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = signupSchema.safeParse(body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username: body.username,
  });
  if (user?._id) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const dbUser = await User.create({
    username: body.username,
    password: body.password,
    firstname: body.firstname,
    lastname: body.lastname,
    balance: body.balance,
  });
  if (!dbUser._id) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  // create a account for the user
  await Account.create({
    userId: dbUser._id,
    balance: 1 + Math.random() * 10000,
  });
  const jwtToken = jwt.sign(
    {
      userId: dbUser._id,
    },
    JWT_SECRET
  );

  return res.json({
    message: "User created successfully",
    token: jwtToken,
  });
});

const signinSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  // zod check, find if user exist, return jwt token
  const { success } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect Inputs",
    });
  }
  const { username, password } = req?.body || {};
  const dbUser = await User.findOne({
    username,
    password,
  });
  if (!dbUser?._id) {
    return res.status(411).json({
      message: "Error while logging in",
    });
  }

  const jwtToken = jwt.sign(
    {
      userId: dbUser._id,
    },
    JWT_SECRET
  );

  res.json({
    token: jwtToken,
  });
});

//update
const updateUserSchema = zod.object({
  password: zod.string().optional(),
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
});
router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateUserSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }
  const userId = req.userId;
  const updateUser = await User.findByIdAndUpdate(userId, req.body);
  if (!updateUser._id) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }
  return res.json({
    message: "Updated successfully",
  });
});

//Fetch user

router.get("/bulk", authMiddleware, async (req, res) => {
  const { filter } = req.query || {};
  const dbUsers = await User.find({
    $or: [
      {
        firstname: {
          $regex: filter,
        },
      },
      {
        lastname: {
          $regex: filter,
        },
      },
    ],
  });
  res.json({
    users:
      dbUsers?.map((user) => ({
        firstName: user?.firstname,
        lastName: user?.lastname,
        username: user?.username,
        _id: user._id,
      })) || [],
  });
});
module.exports = router;
