import { ThemeScript } from "@/app/mathlete/(dashboard)/settings/components/ThemeProvider";

export default function CompetitionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ThemeScript />
            {children}
        </>
    );
}
