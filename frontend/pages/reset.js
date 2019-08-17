import Reset from '../components/Reset'

const Sell = props => (
  <div>
    <p>Reset your Password</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
)

export default Sell
