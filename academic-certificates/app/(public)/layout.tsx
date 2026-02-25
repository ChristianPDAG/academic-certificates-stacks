import Footer from "@/components/navigation/Footer";
import FloatingNav from "@/components/navigation/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FloatingNav />
      {children}
      <Footer />
    </>
  );
}
