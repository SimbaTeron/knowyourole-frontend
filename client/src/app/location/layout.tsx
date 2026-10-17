import Providers from "../providers";

export default function LocationLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
