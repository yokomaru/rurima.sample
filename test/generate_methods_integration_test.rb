# frozen_string_literal: true

require "minitest/autorun"
require "tmpdir"

require_relative "../scripts/generate_methods"

class GenerateMethodsIntegrationTest < Minitest::Test
  def setup
    @database_dir = Pathname.new(ENV.fetch("BITCLUST_DATABASE_DIR", GenerateMethods::DATABASE_DIR.to_s))
    skip "BitClust DB is not available: #{@database_dir}" unless @database_dir.directory?
  end

  def test_generates_a_valid_non_empty_builtin_payload
    Dir.mktmpdir do |directory|
      output_path = File.join(directory, "methods.json")
      GenerateMethods.generate(database_dir: @database_dir, output_path: output_path)
      payload = JSON.parse(File.read(output_path))
      methods = payload.fetch("methods")

      assert_equal "4.0", payload.fetch("ruby_version")
      assert_equal "_builtin", payload.fetch("source_library")
      refute_empty methods
      assert methods.all? { |record| GenerateMethods::REQUIRED_RECORD_KEYS.all? { |key| record.key?(key.to_s) } }
      assert methods.all? { |record| record["example"].nil? || record["example"].is_a?(String) }
      assert_empty GenerateMethods.duplicate_method_keys(methods.map { |record| record.transform_keys(&:to_sym) })

      require "bitclust"
      database = BitClust::MethodDatabase.new(@database_dir.to_s)
      expected_keys = GenerateMethods.selected_entries(database.methods)
                                     .map { |entry| GenerateMethods.method_key(GenerateMethods.record_for(entry)) }
                                     .sort
      actual_keys = methods.map { |record| GenerateMethods.method_key(record.transform_keys(&:to_sym)) }.sort
      assert_equal expected_keys, actual_keys

      sample = methods.find { |record| record["class_name"] == "Array" && record["method_name"] == "sample" }
      refute_nil sample
      assert_equal "instance_method", sample.fetch("method_kind")
      refute_empty sample.fetch("signatures")
      assert_equal "https://docs.ruby-lang.org/ja/4.0/method/Array/i/sample.html", sample.fetch("rurema_url")
    end
  end
end
