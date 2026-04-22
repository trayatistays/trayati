import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PostLoginClient } from "./post-login-client";

export default async function PostLoginPage() {
  const { userId } = await auth();

  // Not signed in — send back to homepage
  if (!userId) {
    redirect("/");
  }

  return <PostLoginClient />;
}
