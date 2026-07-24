-- "Robotics" was removed as an activity category (folded into "Club", since
-- robotics is a domain of club, not a distinct organizational type the way
-- Sport/Music are). Reassign any existing rows so nothing is left pointing
-- at a category the app's dropdown no longer offers.
update public.activities set category = 'Club' where category = 'Robotics';
