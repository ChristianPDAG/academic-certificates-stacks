import { cn } from "@/utils/utils";
import {
  IconSearch,
  IconSchool,
  IconUser,
  IconSettings,
} from "@tabler/icons-react";

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col border py-10 rounded-xl overflow-hidden relative group/feature bg-white/20 dark:bg-black-200/20 backdrop-blur-sm dark:border-neutral-800",
        (index === 0 || index === 4) && "dark:border-neutral-800",
        index < 4 && "dark:border-neutral-800",
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-slate-100 dark:from-slate-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-xl font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />

        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-base text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

const Advantages = () => {
  const features = [
    {
      title: "Explorador Público",
      description:
        "Consulta certificados públicamente sin necesidad de registro.",
        icon: <IconSearch size={40} color="#00A1FF" />,
    },
    {
      title: "Academia",
      description:
        "Emite certificados para tus estudiantes utilizando la blockchain de Stacks.",
        icon: <IconSchool size={40} color="#00A1FF" />,
    },
    {
      title: "Estudiante",
      description:
        "Consulta y verifica tus certificados académicos almacenados en blockchain.",
        icon: <IconUser size={40} color="#00A1FF" />,
    },
    {
      title: "Administrador",
      description: "Gestiona academias autorizadas y administra el sistema.",
        icon: <IconSettings size={40} color="#00A1FF" />,
    }
  ];

  return (
    <section className="relative w-full">
      <div className="bg-[url('/img/bg-waves-1.svg')] w-full h-screen bg-cover bg-center absolute top-0 left-0 opacity-15 dark:opacity-15 -z-10" />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 py-20 max-w-7xl px-4 lg:px-0">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Advantages;
