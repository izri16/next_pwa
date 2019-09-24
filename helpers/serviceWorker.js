import {useEffect} from 'react'

// Installing new service worker is mess
// https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68

function awaitWaitingOnNewWorker(reg, onUpdateAvailable) {
  reg.installing.addEventListener('statechange', () => {
    if (reg.waiting) onUpdateAvailable(reg)
  })
}

// If service worker changed, we refresh the page so it will controle it
const reloadOnServiceWorkerChange = () => {
  navigator.serviceWorker.addEventListener('controllerchange',
    () => window.location.reload()
  )
}

const listenForUpdateAvailable = (reg, onUpdateAvailable) => {
  if (reg.waiting) {
    onUpdateAvailable(reg)
  } else {
    // fired when there's a new service worker being installed
    reg.addEventListener('updatefound', () => {
      // If there is no "waiting" or no "active" working it means the app
      // was loaded first time, and we do not want to handle update then
      if (!reg.waiting && !reg.active) return

      if (reg.waiting) {
        onUpdateAvailable(reg)
      } else if (reg.installing) {
        awaitWaitingOnNewWorker(reg, onUpdateAvailable)
      }
    })
  }
}

export const ServiceWorkerProvider = ({children, fileName, onUpdateAvailable}) => {

  useEffect(() => {
    reloadOnServiceWorkerChange()

    navigator.serviceWorker.register(fileName).then((reg) => {
      // Better UX when update not shown immediately
      setTimeout(() => {
        listenForUpdateAvailable(reg, onUpdateAvailable)
      }, 3000)
    })
  }, [fileName, onUpdateAvailable])

  return children
}
