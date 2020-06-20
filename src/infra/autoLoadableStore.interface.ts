export default interface AutoLoadableStore {
  init(): Promise<void>
  cleanUp(): Promise<void>
}
