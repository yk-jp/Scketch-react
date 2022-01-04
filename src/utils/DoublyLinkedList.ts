export class Node<T> {
  private data: T;
  public next: Node<T> | null;
  public prev :Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }

  public getData():T {
    return this.data;
  }
  public setData(data: T): void {
    this.data = data;
  }
}

export default class DoublyLinkedList<T> {
  private head: Node<T> | null;
  constructor() {
    this.head = null;
  }

  public insertAtTheBeginning(newData: T): void {
    const newNode: Node<T> = new Node(newData);

    if (!this.head) {
      this.head = newNode;
      return;
    }

    this.head.prev = newNode;
    newNode.next = this.head;
    this.head = newNode;
  }

  public moveToNextNode(): void {
    if (!this.head || !this.head.next) return;
    this.head = this.head.next;
  }

  public goBackToPrevNode():void { 
    if(!this.head || !this.head.prev) return;
    this.head = this.head.prev;
  }

  public getHead():Node<T> {
    return this.head;
  }
}
