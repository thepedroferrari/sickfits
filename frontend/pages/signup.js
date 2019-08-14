import SignUp from '../components/Signup'
import SignIn from '../components/Signin'
import Signout from '../components/Signout'
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
    <Signout />
  </Columns>
)

export default SignupPage
