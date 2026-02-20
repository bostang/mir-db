select * from people_apps_map where layer like '%Principal%'

select people.npp, people_apps_map.layer from people join people_apps_map on people_apps_map.npp = people.npp where email like '%telkoms%';

select * from people_apps_map where npp = 'X0155';

select * from people where nama like 'testuser%';

select * from people left join people_apps_map on people.npp = people_apps_map.npp where people.nama like 'testuser%';