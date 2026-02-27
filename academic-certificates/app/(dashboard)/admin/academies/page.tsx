import { getAllAcademies } from "@/app/actions/admin/academies";
import { AcademiesManagement } from "@/app/(dashboard)/admin/academies/_components";

export default async function AcademiesPage() {
    const academies = await getAllAcademies();

    return <AcademiesManagement initialAcademies={academies} />;
}
