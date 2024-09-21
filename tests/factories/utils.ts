import { type PartialDeep } from 'type-fest'

export type ObjectFactory<Model> = (overrides?: PartialDeep<Model>) => Model
