import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

export interface SocialPost {
  id: string;
  caption: string;
  permalink: string;
  imageUrl: string | null;
}

const FALLBACK_POSTS: SocialPost[] = [
  {
    id: "fallback-1",
    caption: "Diseños personalizados con energía Picaflor INK.",
    permalink: INSTAGRAM_URL,
    imageUrl: null,
  },
  {
    id: "fallback-2",
    caption: "Camisetas, mugs y DTF para ideas que quieren color.",
    permalink: INSTAGRAM_URL,
    imageUrl: null,
  },
];

export async function getSocialFeed(): Promise<SocialPost[]> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    return FALLBACK_POSTS;
  }

  return FALLBACK_POSTS.map((post) => ({
    ...post,
    caption: `${INSTAGRAM_HANDLE}: ${post.caption}`,
  }));
}

