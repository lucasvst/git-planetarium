import { Outlet } from "react-router";

export default function () {
    return (
        <div className="prose max-w-full">
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start" />
                <div className="navbar-center">
                    <h1>Planetarium</h1>
                </div>
                <div className="navbar-end" />
            </div>
            <Outlet />
        </div>
    )
}