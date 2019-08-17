import SignUp from '../components/Signup'
import SignIn from '../components/Signin'
import Signout from '../components/Signout'
import RequestReset from '../components/RequestReset'
import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`


const SignupPage = props => (
  <Columns>
    <SignUp />
    <SignIn />
    <RequestReset />
    <Signout />
  </Columns>
)

export default SignupPage
