import { siteConfig } from '../../../../../site.config'

export function ServicesSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Service {i}</h3>
              <p className="text-gray-600">
                Description of service {i} offered by {siteConfig.business.name}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
