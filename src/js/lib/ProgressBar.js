function ProgressBar (progressBarSelector) {
  let uploadProgress = []
  const progressBar = document.querySelector(progressBarSelector)

  if (!progressBar) {
    console.warn('ProgressBar, no selector provided!')
  }

  const updateProgress = (fileNumber, percent) => {
    uploadProgress[fileNumber] = percent
    let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
    console.debug('update', fileNumber, percent, total)
    if (progressBar) {
      progressBar.value = total
    }
  }

  const initializeProgress = (numFiles) => {
    if (!progressBar) {
      console.warn('ProgressBar, no selector provided!')
    } else {
      progressBar.value = 0
    }
    uploadProgress = []
    for (let i = numFiles; i > 0; i--) {
      uploadProgress.push(0)
    }
  }

  return {
    updateProgress: updateProgress,
    initializeProgress: initializeProgress
  }
}

export default ProgressBar
