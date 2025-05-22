interface FeeSharingProps {
  totalAmount: number
  hasThirdPartyVendor: boolean
  thirdPartyAmount: number
  hasReferralFee?: boolean
  referralFeeAmount?: number
  onComplete: (isComplete: boolean) => void
  currency: string
}

export function FeeSharing({
  totalAmount,
  hasThirdPartyVendor,
  thirdPartyAmount,
  hasReferralFee = false,
  referralFeeAmount = 0,
  onComplete,
  currency,
}: FeeSharingProps) {
  // Calculate net fee by subtracting third party vendor amount and referral fee
  const netFee = totalAmount - (hasThirdPartyVendor ? thirdPartyAmount : 0) - (hasReferralFee ? referralFeeAmount : 0)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: currency }).format(amount)
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">총 금액:</div>
        <div className="text-right">{formatCurrency(totalAmount, currency)}</div>

        {hasThirdPartyVendor && thirdPartyAmount > 0 && (
          <>
            <div className="font-medium">3rd party Vendor 금액:</div>
            <div className="text-right text-red-500">- {formatCurrency(thirdPartyAmount, currency)}</div>
          </>
        )}

        {hasReferralFee && referralFeeAmount > 0 && (
          <>
            <div className="font-medium">Referral Fee(Inter company):</div>
            <div className="text-right text-red-500">- {formatCurrency(referralFeeAmount, currency)}</div>
          </>
        )}

        <div className="font-medium border-t pt-2">Net Fee:</div>
        <div className="text-right font-bold border-t pt-2">{formatCurrency(netFee, currency)}</div>
      </div>
    </div>
  )
}
