import pandas as pd
import snscrape.modules.twitter as sntwitter

store_location = "/pine/scr/m/t/mtguo/twitter_covid/search_data"

# defining search terms and building Twitter query
query = '#COVID OR #covid OR covid'
search = query + ' lang:en ' + 'since:2021-01-01 ' + 'until:2021-01-02'

# scraper object with query
tweets_list = []
for i, tweet in enumerate(sntwitter.TwitterSearchScraper(search).get_items()):
    if i > 500:
        break
    tweets_list.append([tweet.date, tweet.id, tweet.user.id, tweet.user.username, tweet.retweetCount, tweet.likeCount, tweet.content])

# convert object to dataframe and save to csv file
print(len(tweets_list))
df = pd.DataFrame(tweets_list, columns=['Datetime', 'Tweet Id', 'User Id', 'User Name', 'Retweets', 'Likes', 'Text'])
df.to_csv(f'{store_location}/covidSample.csv', index=False)
