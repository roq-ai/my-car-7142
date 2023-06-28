import { OrganizationInterface } from 'interfaces/organization';
import { GetQueryInterface } from 'interfaces';

export interface CarInterface {
  id?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  organization_id?: string;
  created_at?: any;
  updated_at?: any;

  organization?: OrganizationInterface;
  _count?: {};
}

export interface CarGetQueryInterface extends GetQueryInterface {
  id?: string;
  make?: string;
  model?: string;
  organization_id?: string;
}
