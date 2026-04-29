import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PostLoginClient } from "./post-login-client";

async function PostLoginContent() {
  await connection();
  const { userId } = await auth();

  // Not signed in — send back to homepage
  if (!userId) {
    redirect("/");
  }

  return <PostLoginClient />;
}

export default function PostLoginPage() {
  return (
    <Suspense fallback={null}>
      <PostLoginContent />
    </Suspense>
  );
}
