import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { SeoContentPage } from "@/components/seo/SeoContentPage";
import { resourcePages, getSeoPageBySlug } from "@/lib/seo-pages";

type PageParams = Promise<{ slug: string }>;

export function generateStaticParams() { return resourcePages.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> { const { slug } = await params; return publicPageMetadata(`/resources/${slug}`); }
export default async function Page({ params }: { params: PageParams }) { const { slug } = await params; return <SeoContentPage page={getSeoPageBySlug(resourcePages, slug)} />; }
