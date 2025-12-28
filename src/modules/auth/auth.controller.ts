import * as service from './auth.service';


export const signup = async (req: any, res: any) => {
  console.log(req.body);
  const user = await service.signup(req.body)
  res.status(201).json({ success: true, message: 'User registered successfully', data: user })
}


export const signin = async (req: any, res: any) => {
  const data = await service.signin(req.body.email, req.body.password)
  res.json({ success: true, message: 'Login successful', data })
}