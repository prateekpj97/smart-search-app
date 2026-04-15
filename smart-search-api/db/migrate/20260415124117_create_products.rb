class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    enable_extension 'pg_trgm'

    create_table :products do |t|
      t.string :title, null: false
      t.text :description
      t.string :category
      t.decimal :price, precision: 10, scale: 2
      t.integer :popularity_score, default: 0

      t.timestamps
    end

    add_index :products, :title, using: :gin, opclass: :gin_trgm_ops
    add_index :products, :description, using: :gin, opclass: :gin_trgm_ops
    add_index :products, :category
    add_index :products, :price
    add_index :products, :popularity_score
  end
end
