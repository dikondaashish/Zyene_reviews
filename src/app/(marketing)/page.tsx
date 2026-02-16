import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const loginUrl = `http://login.${rootDomain}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Zyene Ratings
        </h1>
        <p className="max-w-[600px] text-gray-500 md:text-xl">
          Automate your customer reviews and grow your business.
        </p>
        <div className="flex gap-4">
          <Link href={loginUrl}>
            <Button>Log In</Button>
          </Link>
          <Link href={`${loginUrl}/signup`}>
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
