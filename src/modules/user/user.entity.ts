export class User {
  id: string;
  name: string;

  constructor(props: { id: string; name: string }) {
    this.id = props.id;
    this.name = props.name;
  }
}
