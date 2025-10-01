import { Cog6ToothIcon } from "@heroicons/react/16/solid";
import { NavLink, Outlet } from "react-router";

export default function () {
    return (
        <div className="prose max-w-full">
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start" />
                <div className="navbar-center">
                    <NavLink to="/" className="text-xl">
                        planetarium
                    </NavLink>
                </div>
                <div className="navbar-end">
                    <NavLink to="/settings" className="btn btn-ghost btn-circle">
                        <Cog6ToothIcon className="size-6" />
                    </NavLink>
                </div>
            </div>
            <div className="p-4">
                <Outlet />
            </div>
        </div>
    )
}