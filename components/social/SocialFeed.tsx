import Link from "next/link";
import { getSocialFeed } from "@/server/queries/social";
import { FACEBOOK_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

export default async function SocialFeed() {
  const posts = await getSocialFeed();

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">Últimos trabajos</h2>
          <p
            className="mt-1 break-words text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Síguenos en {INSTAGRAM_HANDLE} y Facebook.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-3 text-sm font-bold sm:w-auto">
          <Link href={INSTAGRAM_URL}>Instagram</Link>
          <Link href={FACEBOOK_URL}>Facebook</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={post.permalink}
            className="rounded-xl p-5"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {post.caption}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
