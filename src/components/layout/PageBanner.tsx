import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageBanner({ title, breadcrumbs }: PageBannerProps) {
  return (
    <section className="bg-gray-100 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
          {title}
        </h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center text-xs md:text-sm text-gray-500"
          >
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={`${item.label}-${idx}`} className="flex items-center">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-gray-900" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <span className="mx-2 text-gray-400">/</span>}
                </span>
              );
            })}
          </nav>
        )}
      </div>
    </section>
  );
}
