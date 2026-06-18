import { PlayerPassCard } from '../../../components/discovery'
import { mockUser } from '../mockData'

export function WalletSection() {
  return (
    <PlayerPassCard
      userName={mockUser.name}
      avatarSrc={mockUser.avatarSrc}
      memberSince={mockUser.memberSince}
      kycVerified={mockUser.kycVerified}
      connectedCount={mockUser.connectedCount}
      totalBalance={mockUser.totalBalance}
      offersCount={mockUser.offersCount}
      connectedCasinos={mockUser.connectedCasinos}
      moreCount={mockUser.moreCount}
    />
  )
}
