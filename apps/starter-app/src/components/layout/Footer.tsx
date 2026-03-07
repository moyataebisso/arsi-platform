import { siteConfig } from '../../../../../site.config'

export function Footer() {
  const { business, integrations } = siteConfig

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-2">{business.name}</h3>
            <p className="text-sm">{business.tagline}</p>
            {business.address && <p className="text-sm mt-2">{business.address}, {business.city}, {business.state} {business.zip}</p>}
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Contact</h4>
            {business.email && <p className="text-sm">{business.email}</p>}
            {business.phone && <p className="text-sm">{business.phone}</p>}
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Follow Us</h4>
            <div className="flex gap-4 text-sm">
              {integrations.instagram && <a href={integrations.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>}
              {integrations.facebookPage && <a href={integrations.facebookPage} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>}
              {integrations.twitter && <a href={integrations.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a>}
              {integrations.linkedin && <a href={integrations.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {business.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
