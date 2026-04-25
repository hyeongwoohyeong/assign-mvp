interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="group rounded-xl border border-navy-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        <span className="text-xs font-medium text-navy-400 group-hover:text-navy-700">
          →
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">{description}</p>
    </div>
  );
}
