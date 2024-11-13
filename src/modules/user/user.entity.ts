export class User {
  id: string;
  name: string;
  email: string;
  password: string;

  constructor(props: { id: string; name: string; email: string; password: string }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
  }
}
