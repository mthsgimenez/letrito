function search(req, res) {
   const query = req.query.q;
   if (query === null) {
      res.send("sjfklajf");
   } else {
      res.send(`Search: ${query}`);
   }
}

export { search };
