import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full items-center flex justify-center flex-col gap-4">
      <span className="text-gray-900 text-4xl">Welcome on our quiz app !</span>
      <Link href="/quiz" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Go to the quiz !</Link>
    </div>
  );
}
