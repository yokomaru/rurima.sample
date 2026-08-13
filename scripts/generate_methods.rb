#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "fileutils"
require "json"
require "pathname"

require "bitclust"

module GenerateMethods
  ROOT = Pathname.new(__dir__).join("..").realpath
  RUREMA_RUBY_VERSION = "4.0"
  BITCLUST_DATABASE_VERSION = "4.0.0"
  DATABASE_DIR = Pathname.new(Dir.home).join(".bitclust", "db-#{BITCLUST_DATABASE_VERSION}")
  OUTPUT_PATH = ROOT.join("docs/data/methods.json")

  METHOD_KINDS = {
    instance_method: "instance_method",
    singleton_method: "class_method",
    module_function: "module_function"
  }.freeze

  REQUIRED_RECORD_KEYS = %i[
    method_name class_name method_kind visibility signatures description example rurema_url
  ].freeze

  module_function

  def plain_text(text)
    CGI.unescapeHTML(text.gsub(/`([^`]*)`/, "\\1"))
       .gsub(/[ \t]+\n/, "\n")
       .strip
  end

  def signatures_from(source)
    source.lines
          .take_while { |line| line.start_with?("### ", "{:", "\n") }
          .grep(/^### (?:module_function )?def /)
          .map { |line| line.sub(/^### (?:module_function )?def /, "").strip }
  end

  def description_from(source)
    body = source.sub(/\A(?:(?:### (?:module_function )?def .*\n|\{:[^\n]*\}\n|\n)+)/, "")
    paragraph = body.split(/\n\s*\n/).find do |part|
      text = part.strip
      !text.empty? && !text.start_with?("```", "- **")
    end
    paragraph && plain_text(paragraph)
  end

  def example_from(source)
    source[/```ruby[^\n]*\n(.*?)^```/m, 1]&.strip
  end

  def target_method?(entry)
    entry.library.name == "_builtin" &&
      METHOD_KINDS.key?(entry.typename) &&
      entry.visibility == :public &&
      !entry.undefined?
  end

  def selected_entries(entries)
    entries.select { |entry| target_method?(entry) }
  end

  def rurema_url(entry)
    class_id = BitClust::NameUtils.encodename_url(entry.klass.name)
    method_id = BitClust::NameUtils.encodename_url(entry.name)
    "https://docs.ruby-lang.org/ja/#{RUREMA_RUBY_VERSION}/method/#{class_id}/#{entry.typechar}/#{method_id}.html"
  end

  def record_for(entry)
    {
      method_name: entry.name,
      class_name: entry.klass.name,
      method_kind: METHOD_KINDS.fetch(entry.typename),
      visibility: entry.visibility.to_s,
      signatures: signatures_from(entry.source),
      description: description_from(entry.source),
      example: example_from(entry.source),
      rurema_url: rurema_url(entry)
    }
  end

  def method_key(record)
    record.values_at(:class_name, :method_kind, :method_name).join("\u0000")
  end

  def duplicate_method_keys(records)
    records.group_by { |record| method_key(record) }
           .select { |_key, entries| entries.size > 1 }
           .keys
  end

  def payload_for(entries)
    methods = selected_entries(entries)
              .sort_by { |entry| [entry.klass.name, entry.typename.to_s, entry.name] }
              .map { |entry| record_for(entry) }
    duplicates = duplicate_method_keys(methods)
    raise "Duplicate methods: #{duplicates.join(', ')}" unless duplicates.empty?

    {
      ruby_version: RUREMA_RUBY_VERSION,
      source_library: "_builtin",
      methods: methods
    }
  end

  def generate(database_dir: DATABASE_DIR, output_path: OUTPUT_PATH)
    database_dir = Pathname.new(database_dir)
    raise "BitClust DB not found: #{database_dir}" unless database_dir.directory?

    database = BitClust::MethodDatabase.new(database_dir.to_s)
    version = database.properties["version"]
    raise "Unexpected BitClust DB version: #{version}" unless version == BITCLUST_DATABASE_VERSION

    payload = payload_for(database.methods)
    output_path = Pathname.new(output_path)
    FileUtils.mkdir_p(output_path.dirname)
    output_path.write(JSON.pretty_generate(payload) + "\n")
    payload
  end
end

if $PROGRAM_NAME == __FILE__
  GenerateMethods.generate
  warn "Generated #{GenerateMethods::OUTPUT_PATH.relative_path_from(GenerateMethods::ROOT)}"
end
