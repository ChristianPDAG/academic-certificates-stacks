export interface Course {
    id_course: string;
    id_academy: string;
    title: string;
    description: string | null;
    category: string | null;
    skills: string[] | null;
    hours: number | null;
    modality: string | null;
    template_image_url: string | null;
    instructor_name: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CourseFormData {
    title: string;
    description?: string;
    category?: string;
    skills?: string[];
    hours?: number;
    modality?: string;
    template_image_url?: string;
    instructor_name?: string;
}
