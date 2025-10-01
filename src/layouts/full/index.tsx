import { Cog6ToothIcon } from "@heroicons/react/16/solid";
import { NavLink, Outlet } from "react-router";

export default function () {
    return (
        <div className="prose max-w-full">
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start" />
                <div className="navbar-center">
                    <NavLink to="/">
                        <h1>Planetarium</h1>
                    </NavLink>
                </div>
                <div className="navbar-end">
                    {/* <button className="btn btn-ghost btn-circle"> */}
                    <NavLink to="/settings">
                        <Cog6ToothIcon className="size-6" />
                    </NavLink>
                    {/* </button> */}
                </div>
            </div>
            <Outlet />
        </div>
    )
}