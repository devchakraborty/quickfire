# QuickFire

QuickFire is a quick way to get up and running with Firebase on Node. Just create a model:

```javascript
// Article.js

import { Model } from 'quickfire'

export default class Article extends Model {}
```

And that's it!

Currently supported methods:

- `Model.create(attributes)`
- `Model.find(id)`
- `Model.count()`
- `modelInstance.update(attributes)`
- `modelInstance.delete()`

```javascript
co(function*() { // Use co to avoid callback hell, but you can use promises if you want
  // Create an article
  let article = yield Article.create({title: "Super provocative headline", url: "https://www.clickbaitnews.com"})
  let updatedArticle = yield article.update({title: "More reasonable headline"})

  let articleId = updatedArticle.id // UUID
  let articleCreatedAt = updatedArticle.createdAt // Set automatically upon .create()
  let articleUpdatedAt = updatedArticle.updatedAt // Set automatically upon .create(), .update()

  let sameArticle = yield Article.find(articleId) // Look up by UUID
  let numArticles = yield Article.count() // Number of articles, 1
  
  yield sameArticle.delete()
})
```
