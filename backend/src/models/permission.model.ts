import { Schema, model } from "mongoose";
import { type IPermission } from "./interfaces/IPermission.interface.js";

const PermissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
});

export const PermissionModel = model<IPermission>("Permission", PermissionSchema);
