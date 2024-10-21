select dt.user as user, dt_name.name as name,\
     dt_name.touxian as touxian, dt.text as text, \
     dt.date as date , dt.id as id, dt.idea as idea\
     , dt.img_show_num as imgShowAll,
    dt.img_all_num as imgAllNum,
    dt.video_num as videoNum
     from dt join dt_name \
     on dt.user = dt_name.user \
     where ${sqlend}  AND dt.shows = 1 \
     order by dt.date desc ;