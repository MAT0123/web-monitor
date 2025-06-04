

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function CreatePortal({ children }: { children: React.ReactNode }) {
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

    useEffect(() => {
        let portal = document.getElementById("portal")
        if (!portal) {
            const portals = document.createElement("div")
            portals.setAttribute("id", "portal")
            document.body.appendChild(portals)
            portal = portals
        }
        setPortalElement(portal)
    }, [])
    if (!portalElement) return null

    return createPortal(children, portalElement)
}
