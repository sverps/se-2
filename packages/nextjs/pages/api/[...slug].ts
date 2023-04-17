import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

if (!process.env.REDIS_URI) {
  console.error("Missing `REDIS_URI` in `package/nextjs/.env.local`");
  process.exit(0);
}

const redis = createClient({
  url: process.env.REDIS_URI,
});
redis.on("error", err => console.log("Redis Client Error", err));

async function handlePostTransaction(transaction: any) {
  const key = transaction.contractAddress + "_" + transaction.chainId;
  await redis.connect();
  const storedTransactionsRaw = await redis.get(key);
  const storedTransactions = storedTransactionsRaw
    ? (JSON.parse(storedTransactionsRaw) as { [hash: string]: { signatures: string[] } | undefined })
    : undefined;
  const updatedTransaction = {
    ...storedTransactions?.[transaction.hash],
    ...transaction,
    signatures: [...(storedTransactions?.[transaction.hash]?.signatures ?? []), transaction.signature].sort((a, b) =>
      a.localeCompare(b),
    ),
  };

  await redis.set(key, JSON.stringify({ ...storedTransactions, [transaction.hash]: updatedTransaction }));
  await redis.disconnect();
  return { success: true };
}

async function handleGetTransactions(key: string) {
  await redis.connect();
  const transaction = await redis.get(key);
  await redis.disconnect();
  return transaction;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${req.method}] ${req.url}`);
  const slug = req.query.slug as string[];

  if (slug[0] === "storage") {
    if (!slug[1] && req.method === "POST") {
      const responseData = await handlePostTransaction(req.body);
      res.status(responseData ? 200 : 404).send(responseData ?? "Not found");
    } else if (slug[1] && req.method === "GET") {
      const responseData = await handleGetTransactions(slug[1]);
      res.status(responseData ? 200 : 404).send(responseData ?? "Not found");
    }
  } else {
    res.status(400).send("Wrong endpoint or method");
  }
}
