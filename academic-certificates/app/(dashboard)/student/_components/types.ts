export interface StudentCertificate {
  id_certificate: string;
  chain_cert_id: number;
  student_name: string;
  student_email: string;
  student_wallet: string;
  grade: string | null;
  status: string;
  created_at: string;
  tx_id: string | null;
  courses: {
    id_course: string;
    title: string;
    hours: number;
  };
  academies: {
    id_academy: string;
    legal_name: string;
    stacks_address: string;
  };
}
