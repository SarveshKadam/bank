const express = require("express");
const zod = require("zod");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const dbBalance = await Account.findOne({
    userId,
  });
  if (!dbBalance?.balance) {
    return res.status(411).json({
      message: "Sorry couldn't get the data",
    });
  }
  return res.json({
    balance: dbBalance.balance,
  });
});
const transferSchema = zod.object({
  to: zod.string(),
  amount: zod.number(),
});
router.post("/transfer", authMiddleware, async (req, res) => {
  const { success } = transferSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid input",
    });
  }
  const giverAccount = await Account.findOne({
    userId: req.userId,
  });
  const { to, amount } = req.body || {};

  if (giverAccount?.balance < amount) {
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }
  const receiver = await Account.findOne({
    userId: to,
  });
  if (!receiver) {
    return res.status(400).json({
      message: "Invalid account",
    });
  }
  await Account.findOneAndUpdate(
    {
      userId: req.userId,
    },
    {
      $inc: {
        balance: -amount,
      },
    }
  );
  await Account.findOneAndUpdate(
    {
      userId: to,
    },
    {
      $inc: {
        balance: amount,
      },
    }
  );

  return res.json({
    message: "Transfer successful",
  });
});

module.exports = router;
