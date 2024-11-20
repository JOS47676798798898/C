'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Ban, CheckCircle } from 'lucide-react'

interface License {
  email: string
  licenseKey: string
  firstUseDate: string
  status: 'active' | 'expired' | 'blocked'
}

const ADMIN_EMAIL = 'vanimateo2@gmail.com'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [licenses, setLicenses] = useState<License[]>([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login')
      }
      setLoading(false)
      loadLicenses()
    })

    return () => unsubscribe()
  }, [router])

  const loadLicenses = () => {
    const allLicenses: License[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('license_')) {
        const licenseData = JSON.parse(localStorage.getItem(key) || '{}')
        console.log('License Data:', licenseData)
        allLicenses.push({
          email: licenseData.userEmail || licenseData.email || 'Unknown',
          licenseKey: key.replace('license_', ''),
          firstUseDate: new Date(licenseData.firstUseDate || Date.now()).toLocaleDateString(),
          status: licenseData.status === 'blocked' ? 'blocked' : 
                 (new Date(licenseData.expirationDate) > new Date() ? 'active' : 'expired')
        })
      }
    }
    setLicenses(allLicenses)
  }

  const handleRevoke = (licenseKey: string) => {
    localStorage.removeItem(`license_${licenseKey}`)
    loadLicenses()
  }

  const handleBlock = (licenseKey: string) => {
    const key = `license_${licenseKey}`
    const licenseData = JSON.parse(localStorage.getItem(key) || '{}')
    licenseData.status = 'blocked'
    localStorage.setItem(key, JSON.stringify(licenseData))
    loadLicenses()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="p-4">Email</th>
            <th className="p-4">License Key</th>
            <th className="p-4">First Use Date</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {licenses.map((license) => (
            <tr key={license.licenseKey}>
              <td className="p-4">{license.email}</td>
              <td className="p-4">{license.licenseKey}</td>
              <td className="p-4">{license.firstUseDate}</td>
              <td className="p-4">
                {license.status === 'active' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" /> Active
                  </span>
                ) : license.status === 'blocked' ? (
                  <span className="flex items-center text-orange-600">
                    <Ban className="w-4 h-4 mr-2" /> Blocked
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <Ban className="w-4 h-4 mr-2" /> Expired
                  </span>
                )}
              </td>
              <td className="p-4 space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevoke(license.licenseKey)}
                >
                  Revoke
                </Button>
                {license.status !== 'blocked' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBlock(license.licenseKey)}
                  >
                    Block
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {licenses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No licenses found
        </div>
      )}
    </div>
  )
} 