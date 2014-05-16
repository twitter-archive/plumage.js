
run Rack::Cascade.new([
  Rack::File.new("test"),
  Rack::File.new("app/assets/javascripts"),
  Rack::File.new("vendor/assets/javascripts")
])
