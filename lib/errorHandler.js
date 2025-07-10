// lib/errorHandler.js

export const getFriendlyErrorMessage = (error, fallbackMessage = "Something went wrong") => {
  if (error.code === "CALL_EXCEPTION" || error.message?.includes("missing revert data")) {
    return "The operation isn't allowed. This may not be eligible or failed due to contract state."
  }

  if (error.message?.includes("user rejected")) {
    return "You cancelled the transaction."
  }
  if (error.message?.includes("Error requesting refund")) {
    return "Failed to request refund. This may be due to insufficient funds or the transaction being invalid."
  }
  if (error.message?.includes("Error withdrawing refund")) {
    return "Failed to request withdrawal. This may be due to insufficient funds or the transaction being invalid."
  }
  if (error.message?.includes("Error contributing to campaign")) {
    return "Failed to contribute to campaign. This may be due to insufficient funds or the transaction being invalid."
  }

  if (error.message?.includes("insufficient funds")) {
    return "Not enough ETH to cover gas fees."
  }

  return fallbackMessage
}
export const handleError = (error, fallbackMessage) => {
  const message = getFriendlyErrorMessage(error, fallbackMessage)
  console.error(message, error)
  return message
}