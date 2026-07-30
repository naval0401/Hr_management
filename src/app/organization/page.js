"use client";

import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Search,
    SlidersHorizontal,
    ChevronRight,
    Building2,
} from "lucide-react";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {

    const [profile, setProfile] = useState(null);
    const [team, setTeam] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const searchParams = useSearchParams();
    const employeeId = searchParams.get("id");
    const [search, setSearch] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    const departments = [
        ...new Set(
            employees
                .map(emp => emp.department)
                .filter(Boolean)
        ),
    ];

    const fetchEmployees = async () => {

        try {

            await keycloak.updateToken(30);


            const res = await fetch("/api/employees", {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            });

            const data = await res.json();

            const employeeList = Array.isArray(data) ? data : [];

            setEmployees(employeeList);

            // URL se employee find karo
            let currentEmployee = employeeList.find(
                (emp) => String(emp.id) === String(employeeId)
            );

            // Agar URL me id nahi hai ya employee nahi mila
            if (!currentEmployee) {
                currentEmployee = employeeList[0];
            }

            setProfile(currentEmployee);

            const reportees = employeeList.filter(
                (emp) => emp.reporting_manager?.id === currentEmployee.id
            );

            setTeam(reportees);

        }
        catch (err) {

            console.log("PROFILE ERROR:", err);

        }
        finally {

            setLoading(false);

        }

    };

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams");
            const data = await res.json();

            setTeamList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchTeams();
    }, [employeeId]);



    // same page par profile change karega
    const changeProfile = (employee) => {

    setProfile(employee);

    const reportees = employees.filter(
        (emp) => emp.reporting_manager?.id === employee.id
    );

    setTeam(reportees);

    // Search clear
    setSearch("");

    // Optional: filter bhi reset kar do
    setFilterValue("");

};

    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );

    }

    if (!profile) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                Employee not found
            </div>
        );

    }

    const filteredEmployees = (() => {
    // Search -> poore employees table me
    if (search.trim() !== "") {
        return employees.filter((emp) =>
            emp.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email?.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Team filter
    if (filterValue.startsWith("team-")) {
        const teamId = filterValue.replace("team-", "");

        const selectedTeam = teamList.find(
            (t) => String(t.id) === teamId
        );

        if (!selectedTeam) return [];

        return employees.filter((emp) =>
            selectedTeam.members?.includes(emp.id) ||
            selectedTeam.members?.includes(String(emp.id))
        );
    }

    // Department filter
    if (filterValue.startsWith("dept-")) {
        const dept = filterValue.replace("dept-", "");

        return employees.filter(
            (emp) => emp.department === dept
        );
    }

    // Default -> current profile ke reportees
    return team;
})();


    return (

        <main className="min-h-screen bg-[#f7f8f6] p-6">


            {/* HEADER */}

            <section className="rounded-3xl bg-green-600 text-white p-10 flex justify-between items-center">


                <div className="flex gap-6 items-center ">


                    <div className="h-16 w-16 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl font-bold">

                        {profile.employee_name?.slice(0, 2).toUpperCase()}

                    </div>

                    <div>

                        <p className="text-sm tracking-widest text-green-200">
                            PEOPLE PROFILE
                        </p>

                        <h1 className="text-5xl font-serif mt-2">
                            {profile.employee_name}
                        </h1>

                        <div className="flex gap-3 mt-4 text-lg">

                            <span>
                                {profile.designation}
                            </span>

                            <span>
                                •
                            </span>

                            <span>
                                {profile.department}
                            </span>

                        </div>

                        <div className="flex gap-3 mt-4">

                            <span className="flex items-center gap-2 border border-white/30 rounded-full px-4 py-2">

                                <Building2 size={16} />

                                {profile.department}

                            </span>

                            <span className="bg-green-100 text-green-500 px-4 py-2 rounded-full">

                                ● {profile.status ? "Active" : "Inactive"}

                            </span>

                        </div>

                    </div>

                </div>

                <div className="border-l border-white/20 pl-12">


                    <h2 className="text-5xl font-serif">
                        {team.length}
                    </h2>


                    <p className="text-green-100">
                        Direct reports
                    </p>

                    <div className="flex mt-5">

                        {
                            team.slice(0, 5).map(emp => (

                                <div
                                    key={emp.id}
                                    className="w-12 h-12 rounded-full bg-white text-gray-600 flex items-center justify-center border-2 border-green-500 -ml-2">
                                    {emp.employee_name?.slice(0, 2).toUpperCase()}

                                </div>

                            ))
                        }

                    </div>

                </div>

            </section>

            {/* DETAILS */}

            <section className="bg-white rounded-2xl mt-6 p-8">


                <div className="flex gap-6 items-center mb-4 pb-2 border-b-mist-400 ">

                    <span className="text-gray-500 tracking-widest text-sm">
                        EMPLOYEE DETAILS
                    </span>


                    <h2 className="font-semibold text-3xl">
                        Contact & work details
                    </h2>

                </div>

                <div className="grid grid-cols-4 mt-8 pt-6">


                    <Info
                        icon={<Mail />}
                        title="Work email"
                        value={profile.email}
                    />


                    <Info
                        icon={<Phone />}
                        title="Phone number"
                        value={profile.phone}
                    />

                    <Info
                        icon={<MapPin />}
                        title="Location"
                        value={profile.location}
                    />


                    <Info
                        icon={<Calendar />}
                        title="Joined"
                        value={profile.date_of_joining}
                    />

                </div>

            </section>

            {/* TEAM */}

            <section className="mt-10">


                <div className="flex justify-between items-center">


                    <div>

                        <p className="text-gray-500 tracking-widest text-sm">
                            TEAM MEMBERS
                        </p>


                        <h2 className="font-serif text-4xl mt-2">

                            Direct reports

                            <span className="text-sm bg-green-100 text-green-700 rounded-full px-3 py-1 ml-2">

                                {team.length}

                            </span>

                        </h2>
                        <h5>Choose a team member to open their employee profile.</h5>

                    </div>



                    <div className="flex gap-3">


                        <div className="bg-white border rounded-xl px-4 py-3 flex items-center gap-3">
                            <Search size={18} className="text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search team member..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="outline-none bg-transparent w-56"
                            />
                        </div>


                        <div className="bg-white border rounded-xl px-4 py-3 flex items-center gap-2">
                            <SlidersHorizontal size={18} />

                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="outline-none bg-transparent"
                            >

                                <option value="">
                                    Select Employee
                                </option>

                                <option value="All">
                                    All Employees
                                </option>

                                <optgroup label="Teams">
                                    {teamList.map((team) => (
                                        <option
                                            key={team.id}
                                            value={`team-${team.id}`}
                                        >
                                            {team.team_name}
                                        </option>
                                    ))}
                                </optgroup>

                                <optgroup label="Departments">
                                    {departments.map((dept) => (
                                        <option
                                            key={dept}
                                            value={`dept-${dept}`}
                                        >
                                            {dept}
                                        </option>
                                    ))}
                                </optgroup>

                            </select>
                        </div>


                    </div>


                </div>





                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">


                    {
                        filteredEmployees.map(person => (


                            <div

                                key={person.id}

                                onClick={() => changeProfile(person)}

                                className="bg-white rounded-2xl p-5 flex justify-between items-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl"

                            >


                                <div className="flex gap-4 items-center">


                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">

                                        {person.employee_name?.slice(0, 2).toUpperCase()}

                                    </div>



                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {person.employee_name}
                                        </h3>
                                        <p className="text-gray-500">
                                            {person.designation}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {person.department}
                                        </p>
                                    </div>

                                </div>



                                <ChevronRight className="text-gray-400" />


                            </div>


                        ))
                    }


                </div>


            </section>


        </main>

    );

}





function Info({ icon, title, value }) {

    return (

        <div className="flex gap-4">

            <div className="text-green-700">
                {icon}
            </div>


            <div>

                <p className="text-gray-500">
                    {title}
                </p>


                <p className="font-medium mt-2">
                    {value || "-"}
                </p>


            </div>


        </div>

    )

}