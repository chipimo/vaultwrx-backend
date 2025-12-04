import { User } from '@api/models/Users/User';
import { Retailer } from '@api/models/Users/Retailer';
import { Customer } from '@api/models/Users/Customer';
import { Staff } from '@api/models/Users/Staff';
import { FuneralDirector } from '@api/models/Users/FuneralDirector';
import { Admin } from '@api/models/Users/Admin';
import { Company } from '@api/models/Company/Company';
import { Order } from '@api/models/Orders/Order';
import { OrderItem } from '@api/models/Orders/OrderItem';
import { Deceased } from '@api/models/Orders/Deceased';
import { Photo } from '@api/models/Orders/Photo';
import { OrderExtraCharge } from '@api/models/Orders/OrderExtraCharge';
import { DeliverySchedule } from '@api/models/Orders/DeliverySchedule';
import { OrderContact } from '@api/models/Orders/OrderContact';
import { Comment } from '@api/models/Orders/Comment';
import { Product } from '@api/models/Products/Product';
import { Vault } from '@api/models/Products/Vault';
import { Casket } from '@api/models/Products/Casket';
import { Urn } from '@api/models/Products/Urn';
import { GraveDigging } from '@api/models/Products/GraveDigging';
import { Cremation } from '@api/models/Products/Cremation';
import { Monument } from '@api/models/Products/Monument';
import { BulkPrecast } from '@api/models/Products/BulkPrecast';
import { Color } from '@api/models/Products/Color';
import { Location } from '@api/models/Products/Location';
import { ServiceExtra } from '@api/models/Products/ServiceExtra';
import { Permission } from '@api/models/Security/Permission';
import { Role } from '@api/models/Security/Role';
import { AuditLog } from '@api/models/Audit/AuditLog';

const allEntities = [
  User,
  Retailer,
  Customer,
  Staff,
  FuneralDirector,
  Admin,
  Company,
  Order,
  OrderItem,
  Deceased,
  Photo,
  OrderExtraCharge,
  DeliverySchedule,
  OrderContact,
  Comment,
  Product,
  Vault,
  Casket,
  Urn,
  GraveDigging,
  Cremation,
  Monument,
  BulkPrecast,
  Color,
  Location,
  ServiceExtra,
  Permission,
  Role,
  AuditLog,
].filter((entity) => entity != null && typeof entity === 'function');

export const entities = allEntities;

